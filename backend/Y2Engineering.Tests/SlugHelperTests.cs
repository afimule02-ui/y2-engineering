using Xunit;
using Y2Engineering.Application.Common;

namespace Y2Engineering.Tests;

public class SlugHelperTests
{
    [Theory]
    [InlineData("Machine Installation & Commissioning", "machine-installation-commissioning")]
    [InlineData("Stainless Steel Welding", "stainless-steel-welding")]
    [InlineData("Quality & Production Consulting", "quality-production-consulting")]
    public void Generate_ProducesUrlSafeSlugs(string input, string expected)
    {
        Assert.Equal(expected, SlugHelper.Generate(input));
    }

    [Fact]
    public void Generate_HandlesAccentedCharacters()
    {
        Assert.Equal("cafe", SlugHelper.Generate("café"));
    }

    [Fact]
    public void Generate_ReturnsEmptyForNullOrWhiteSpace()
    {
        Assert.Equal(string.Empty, SlugHelper.Generate(null!));
        Assert.Equal(string.Empty, SlugHelper.Generate("   "));
    }
}
