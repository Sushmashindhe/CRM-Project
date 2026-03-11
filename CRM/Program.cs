using CRM.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// JWT Key
var key = builder.Configuration["Jwt:Key"];

// --------------------
// 1️⃣ Configure DbContext
// --------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// --------------------
// 2️⃣ Configure JWT Authentication
// --------------------
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; // allow local testing
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,      // disable issuer check
        ValidateAudience = false,    // disable audience check
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(key!)
        )
    };
});

// --------------------
// 3️⃣ Add Authorization + Controllers
// --------------------
builder.Services.AddAuthorization();
builder.Services.AddControllers();

// --------------------
// 4️⃣ Build App
// --------------------
var app = builder.Build();

// --------------------
// 5️⃣ Middleware Pipeline
// --------------------
app.UseStaticFiles();

app.UseHttpsRedirection();

app.UseAuthentication();   // must be before authorization
app.UseAuthorization();

app.MapControllers();

app.Run();