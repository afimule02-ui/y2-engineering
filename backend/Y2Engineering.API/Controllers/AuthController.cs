using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Y2Engineering.API.Auth;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Crm;
using Y2Engineering.Domain.Identity;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ITokenService _tokenService;
    private readonly PermissionResolver _permissionResolver;
    private readonly ICurrentUser _currentUser;
    private readonly IRepository<Company> _companies;
    private readonly IRepository<Customer> _customers;
    private readonly INumberGenerator _numbers;
    private readonly IValidator<RegisterRequest> _registerValidator;
    private readonly IValidator<LoginRequest> _loginValidator;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        ITokenService tokenService,
        PermissionResolver permissionResolver,
        ICurrentUser currentUser,
        IRepository<Company> companies,
        IRepository<Customer> customers,
        INumberGenerator numbers,
        IValidator<RegisterRequest> registerValidator,
        IValidator<LoginRequest> loginValidator)
    {
        _userManager = userManager;
        _tokenService = tokenService;
        _permissionResolver = permissionResolver;
        _currentUser = currentUser;
        _companies = companies;
        _customers = customers;
        _numbers = numbers;
        _registerValidator = registerValidator;
        _loginValidator = loginValidator;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Register(RegisterRequest request, CancellationToken ct)
    {
        var validation = await _registerValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });
        }

        var user = new ApplicationUser
        {
            UserName = request.Email,
            Email = request.Email,
            FullName = request.FullName,
            PhoneNumber = request.Phone,
            EmailConfirmed = true
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });
        }

        await _userManager.AddToRoleAsync(user, "Customer");

        // Create the linked CRM customer record so the portal has data to show.
        Company? company = null;
        if (!string.IsNullOrWhiteSpace(request.CompanyName))
        {
            company = new Company { Name = request.CompanyName };
            await _companies.AddAsync(company, ct);
            await _companies.SaveChangesAsync(ct);
        }

        var customer = new Customer
        {
            CustomerCode = await _numbers.NextAsync(NumberType.Customer, ct),
            CompanyId = company?.Id,
            ContactPerson = request.FullName,
            Email = request.Email,
            Phone = request.Phone,
            UserAccountId = user.Id,
            IsActive = true
        };

        await _customers.AddAsync(customer, ct);
        await _customers.SaveChangesAsync(ct);

        return Ok(await BuildTokenResponseAsync(user, ct));
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<TokenResponse>> Login(LoginRequest request, CancellationToken ct)
    {
        var validation = await _loginValidator.ValidateAsync(request, ct);
        if (!validation.IsValid)
        {
            return BadRequest(new { errors = validation.Errors.Select(e => e.ErrorMessage) });
        }

        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user is null || !await _userManager.CheckPasswordAsync(user, request.Password))
        {
            return Unauthorized(new { error = "Invalid email or password." });
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        return Ok(await BuildTokenResponseAsync(user, ct));
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> Me(CancellationToken ct)
    {
        if (_currentUser.UserId is null)
        {
            return Unauthorized();
        }

        var user = await _userManager.FindByIdAsync(_currentUser.UserId.Value.ToString());
        if (user is null)
        {
            return Unauthorized();
        }

        var roles = (await _userManager.GetRolesAsync(user)).ToList();
        var permissions = (await _permissionResolver.GetPermissionsAsync(user.Id, ct)).ToList();

        return Ok(new UserProfileDto(
            user.Id,
            user.FullName,
            user.Email ?? string.Empty,
            roles,
            permissions,
            user.Language,
            user.CompanyId));
    }

    private async Task<TokenResponse> BuildTokenResponseAsync(ApplicationUser user, CancellationToken ct)
    {
        var roles = (await _userManager.GetRolesAsync(user)).ToList();
        var permissions = (await _permissionResolver.GetPermissionsAsync(user.Id, ct)).ToList();
        var token = _tokenService.CreateToken(user, roles, permissions);

        return new TokenResponse(
            token,
            DateTime.UtcNow.AddMinutes(480),
            new UserProfileDto(user.Id, user.FullName, user.Email ?? string.Empty, roles, permissions, user.Language, user.CompanyId));
    }
}
