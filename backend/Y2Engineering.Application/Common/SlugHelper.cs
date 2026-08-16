using System.Text;
using System.Text.RegularExpressions;

namespace Y2Engineering.Application.Common;

public static partial class SlugHelper
{
    public static string Generate(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
        {
            return string.Empty;
        }

        var normalized = input.ToLowerInvariant().Trim();
        normalized = NormalizeChars(normalized);
        normalized = InvalidCharsRegex().Replace(normalized, "-");
        normalized = MultipleDashesRegex().Replace(normalized, "-");

        return normalized.Trim('-');
    }

    private static string NormalizeChars(string input)
    {
        // Fold common accented letters to ASCII so slugs stay URL-safe.
        var sb = new StringBuilder(input.Length);
        foreach (var c in input.Normalize(NormalizationForm.FormD))
        {
            sb.Append(System.Globalization.CharUnicodeInfo.GetUnicodeCategory(c) ==
                      System.Globalization.UnicodeCategory.NonSpacingMark
                ? '\0'
                : c);
        }

        return sb.ToString().Replace("\0", string.Empty);
    }

    [GeneratedRegex(@"[^a-z0-9]+")]
    private static partial Regex InvalidCharsRegex();

    [GeneratedRegex(@"-{2,}")]
    private static partial Regex MultipleDashesRegex();
}
