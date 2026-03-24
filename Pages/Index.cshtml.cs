using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace EchoType.Pages;

public class IndexModel : PageModel
{
    private readonly ILogger<IndexModel> _logger;

    public IndexModel(ILogger<IndexModel> logger)
    {
        _logger = logger;
    }

    // Handles GET / — just renders the page.
    // All detection happens client-side in site.js.
    public void OnGet()
    {
        _logger.LogInformation("EchoType loaded at {Time}", DateTime.UtcNow);
    }

    // Optional POST endpoint — logs the submission server-side.
    // Call from JS: fetch('?handler=Submit', { method:'POST',
    //   body: JSON.stringify({ input: "..." }),
    //   headers: { 'Content-Type': 'application/json' } })
    public IActionResult OnPostSubmit([FromBody] SubmitRequest req)
    {
        if (string.IsNullOrWhiteSpace(req?.Input))
            return BadRequest();

        _logger.LogInformation("User submitted: {Input}", req.Input);
        return new JsonResult(new { ok = true, received = req.Input });
    }
}

public class SubmitRequest
{
    public string? Input { get; set; }
}
