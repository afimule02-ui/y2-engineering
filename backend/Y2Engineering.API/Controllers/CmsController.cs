using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Y2Engineering.Application.Common;
using Y2Engineering.Application.DTOs;
using Y2Engineering.Application.Interfaces;
using Y2Engineering.Domain.Cms;
using Y2Engineering.Domain.Identity;

namespace Y2Engineering.API.Controllers;

[ApiController]
[Route("api/cms")]
public class CmsController : ControllerBase
{
    private readonly IRepository<Page> _pages;
    private readonly IRepository<BlogPost> _blog;
    private readonly IRepository<Faq> _faqs;
    private readonly IRepository<Testimonial> _testimonials;

    public CmsController(
        IRepository<Page> pages,
        IRepository<BlogPost> blog,
        IRepository<Faq> faqs,
        IRepository<Testimonial> testimonials)
    {
        _pages = pages;
        _blog = blog;
        _faqs = faqs;
        _testimonials = testimonials;
    }

    [HttpGet("pages")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<ActionResult<List<PageDto>>> Pages(CancellationToken ct)
    {
        var pages = await _pages.Query()
            .OrderBy(p => p.SortOrder)
            .Select(p => new PageDto(
                p.Id, p.Title, p.Slug, p.Content, p.IsPublished, p.MetaTitle, p.MetaDescription, p.SortOrder))
            .ToListAsync(ct);

        return Ok(pages);
    }

    [HttpGet("pages/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<PageDto>> Page(string slug, CancellationToken ct)
    {
        var page = await _pages.Query()
            .Where(p => p.Slug == slug && p.IsPublished)
            .Select(p => new PageDto(
                p.Id, p.Title, p.Slug, p.Content, p.IsPublished, p.MetaTitle, p.MetaDescription, p.SortOrder))
            .FirstOrDefaultAsync(ct);

        return page is null ? NotFound() : Ok(page);
    }

    [HttpGet("blog/manage")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<ActionResult<List<BlogPostDto>>> BlogManage(CancellationToken ct)
    {
        var posts = await _blog.Query()
            .OrderByDescending(b => b.PublishedAt)
            .Select(b => new BlogPostDto(
                b.Id, b.Title, b.Slug, b.Excerpt, null, b.Category, b.Tags, b.IsPublished, b.PublishedAt))
            .ToListAsync(ct);

        return Ok(posts);
    }

    [HttpGet("blog")]
    [AllowAnonymous]
    public async Task<ActionResult<List<BlogPostDto>>> Blog(CancellationToken ct)
    {
        var posts = await _blog.Query()
            .Where(b => b.IsPublished)
            .OrderByDescending(b => b.PublishedAt)
            .Select(b => new BlogPostDto(
                b.Id, b.Title, b.Slug, b.Excerpt, null, b.Category, b.Tags, b.IsPublished, b.PublishedAt))
            .ToListAsync(ct);

        return Ok(posts);
    }

    [HttpGet("blog/{slug}")]
    [AllowAnonymous]
    public async Task<ActionResult<BlogPostDto>> BlogPost(string slug, CancellationToken ct)
    {
        var post = await _blog.Query()
            .Where(b => b.Slug == slug && b.IsPublished)
            .Select(b => new BlogPostDto(
                b.Id, b.Title, b.Slug, b.Excerpt, b.Content, b.Category, b.Tags, b.IsPublished, b.PublishedAt))
            .FirstOrDefaultAsync(ct);

        return post is null ? NotFound() : Ok(post);
    }

    [HttpGet("faqs/manage")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<ActionResult<List<FaqDto>>> FaqsManage(CancellationToken ct)
    {
        var faqs = await _faqs.Query()
            .OrderBy(f => f.SortOrder)
            .Select(f => new FaqDto(f.Id, f.Question, f.Answer, f.Category, f.SortOrder, f.IsActive))
            .ToListAsync(ct);

        return Ok(faqs);
    }

    [HttpGet("faqs")]
    [AllowAnonymous]
    public async Task<ActionResult<List<FaqDto>>> Faqs(CancellationToken ct)
    {
        var faqs = await _faqs.Query()
            .Where(f => f.IsActive)
            .OrderBy(f => f.SortOrder)
            .Select(f => new FaqDto(f.Id, f.Question, f.Answer, f.Category, f.SortOrder, f.IsActive))
            .ToListAsync(ct);

        return Ok(faqs);
    }

    [HttpGet("testimonials")]
    [AllowAnonymous]
    public async Task<ActionResult<List<TestimonialDto>>> Testimonials(CancellationToken ct)
    {
        var testimonials = await _testimonials.Query()
            .Where(t => t.IsActive)
            .OrderBy(t => t.CreatedAt)
            .Select(t => new TestimonialDto(t.Id, t.CustomerName, t.CompanyName, t.Content, t.Rating, t.IsActive))
            .ToListAsync(ct);

        return Ok(testimonials);
    }

    [HttpPost("pages")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<ActionResult<PageDto>> CreatePage(CreatePageDto dto, CancellationToken ct)
    {
        var page = new Page
        {
            Title = dto.Title,
            Slug = string.IsNullOrWhiteSpace(dto.Slug) ? SlugHelper.Generate(dto.Title) : dto.Slug,
            Content = dto.Content,
            IsPublished = dto.IsPublished,
            MetaTitle = dto.MetaTitle,
            MetaDescription = dto.MetaDescription,
            SortOrder = dto.SortOrder
        };

        await _pages.AddAsync(page, ct);
        await _pages.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Page), new { slug = page.Slug }, ToPageDto(page));
    }

    [HttpPut("pages/{id:guid}")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<IActionResult> UpdatePage(Guid id, CreatePageDto dto, CancellationToken ct)
    {
        var page = await _pages.GetByIdAsync(id, ct);
        if (page is null)
        {
            return NotFound();
        }

        page.Title = dto.Title;
        page.Slug = string.IsNullOrWhiteSpace(dto.Slug) ? SlugHelper.Generate(dto.Title) : dto.Slug;
        page.Content = dto.Content;
        page.IsPublished = dto.IsPublished;
        page.MetaTitle = dto.MetaTitle;
        page.MetaDescription = dto.MetaDescription;
        page.SortOrder = dto.SortOrder;
        page.UpdatedAt = DateTime.UtcNow;

        await _pages.SaveChangesAsync(ct);
        return Ok(ToPageDto(page));
    }

    [HttpPost("blog")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<ActionResult<BlogPostDto>> CreateBlog(CreateBlogPostDto dto, CancellationToken ct)
    {
        var post = new BlogPost
        {
            Title = dto.Title,
            Slug = string.IsNullOrWhiteSpace(dto.Slug) ? SlugHelper.Generate(dto.Title) : dto.Slug,
            Excerpt = dto.Excerpt,
            Content = dto.Content,
            Category = dto.Category,
            Tags = dto.Tags,
            IsPublished = dto.IsPublished,
            PublishedAt = dto.IsPublished ? dto.PublishedAt ?? DateTime.UtcNow : null
        };

        await _blog.AddAsync(post, ct);
        await _blog.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(BlogPost), new { slug = post.Slug }, new BlogPostDto(
            post.Id, post.Title, post.Slug, post.Excerpt, post.Content, post.Category, post.Tags,
            post.IsPublished, post.PublishedAt));
    }

    [HttpPut("blog/{id:guid}")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<IActionResult> UpdateBlog(Guid id, CreateBlogPostDto dto, CancellationToken ct)
    {
        var post = await _blog.GetByIdAsync(id, ct);
        if (post is null)
        {
            return NotFound();
        }

        post.Title = dto.Title;
        post.Slug = string.IsNullOrWhiteSpace(dto.Slug) ? SlugHelper.Generate(dto.Title) : dto.Slug;
        post.Excerpt = dto.Excerpt;
        post.Content = dto.Content;
        post.Category = dto.Category;
        post.Tags = dto.Tags;
        post.IsPublished = dto.IsPublished;
        post.PublishedAt = dto.IsPublished ? dto.PublishedAt ?? DateTime.UtcNow : null;
        post.UpdatedAt = DateTime.UtcNow;

        await _blog.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("blog/{id:guid}")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<IActionResult> DeleteBlog(Guid id, CancellationToken ct)
    {
        var post = await _blog.GetByIdAsync(id, ct);
        if (post is null)
        {
            return NotFound();
        }

        _blog.Remove(post);
        await _blog.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("faqs")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<ActionResult<FaqDto>> CreateFaq(FaqDto dto, CancellationToken ct)
    {
        var faq = new Faq
        {
            Question = dto.Question,
            Answer = dto.Answer,
            Category = dto.Category,
            SortOrder = dto.SortOrder,
            IsActive = dto.IsActive
        };

        await _faqs.AddAsync(faq, ct);
        await _faqs.SaveChangesAsync(ct);

        return CreatedAtAction(nameof(Faqs), new FaqDto(
            faq.Id, faq.Question, faq.Answer, faq.Category, faq.SortOrder, faq.IsActive));
    }

    [HttpPut("faqs/{id:guid}")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<IActionResult> UpdateFaq(Guid id, FaqDto dto, CancellationToken ct)
    {
        var faq = await _faqs.GetByIdAsync(id, ct);
        if (faq is null)
        {
            return NotFound();
        }

        faq.Question = dto.Question;
        faq.Answer = dto.Answer;
        faq.Category = dto.Category;
        faq.SortOrder = dto.SortOrder;
        faq.IsActive = dto.IsActive;
        faq.UpdatedAt = DateTime.UtcNow;

        await _faqs.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("faqs/{id:guid}")]
    [Authorize(Policy = Permissions.CmsManage)]
    public async Task<IActionResult> DeleteFaq(Guid id, CancellationToken ct)
    {
        var faq = await _faqs.GetByIdAsync(id, ct);
        if (faq is null)
        {
            return NotFound();
        }

        _faqs.Remove(faq);
        await _faqs.SaveChangesAsync(ct);
        return NoContent();
    }

    private static PageDto ToPageDto(Page p) => new(
        p.Id, p.Title, p.Slug, p.Content, p.IsPublished, p.MetaTitle, p.MetaDescription, p.SortOrder);
}
