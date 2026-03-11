using CRM.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

var key = builder.Configuration["Jwt:Key"];


// --------------------
// 1️⃣ Configure DbContext
// --------------------
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// --------------------
// 2️⃣ Configure JWT Authentication
// --------------------

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = true; // set to false if using HTTP in dev
    options.SaveToken = true;

#pragma warning disable CS8604 // Possible null reference argument.
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,

        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
    };
#pragma warning restore CS8604 // Possible null reference argument.
});

// --------------------
// 3️⃣ Add Authorization and Controllers
// --------------------
builder.Services.AddAuthorization();
builder.Services.AddControllers();

// --------------------
// 4️⃣ Build the app
// --------------------
;
var app = builder.Build();


// --------------------
// 5️⃣ Middleware
// --------------------
app.UseStaticFiles();

app.UseHttpsRedirection();

// ⚠️ Important Order
app.UseAuthentication(); // Must come before UseAuthorization
app.UseAuthorization();

app.MapControllers();

app.Run();