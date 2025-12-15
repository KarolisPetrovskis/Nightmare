using backend.Server.Database;
using backend.Server.Interfaces;
using backend.Server.Middleware;
using backend.Server.Models.Configuration;
using backend.Server.Services;
using DotNetEnv;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.EntityFrameworkCore;
using Stripe;

// Load .env file before building the app
Env.Load();

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddEnvironmentVariables();

// Configure Stripe settings from environment variables
var stripeSettings = new StripeSettings
{
    SecretKey = builder.Configuration["STRIPE_SECRET_KEY"] ?? string.Empty,
    PublishableKey = builder.Configuration["STRIPE_PUBLISHABLE_KEY"] ?? string.Empty,
    WebhookSecret = builder.Configuration["STRIPE_WEBHOOK_SECRET"] ?? string.Empty
};
builder.Services.AddSingleton(stripeSettings);
StripeConfiguration.ApiKey = stripeSettings.SecretKey;

// Build the connection string using config values
var dbHost = builder.Configuration["DB_HOST"];
var dbName = builder.Configuration["DB_NAME"];
var dbUser = builder.Configuration["DB_USER"];
var dbPassword = builder.Configuration["DB_PASSWORD"];
var dbPort = builder.Configuration["DB_PORT"] ?? "5432";

var connectionString =
    $"Host={dbHost};Port={dbPort};Database={dbName};Username={dbUser};Password={dbPassword}";

// Register DbContext
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString)
);



builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        p => p.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();

// Register application services
builder.Services.AddScoped<IAppointmentsService, AppointmentsService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IBusinessService, BusinessService>();
builder.Services.AddScoped<IEmployeesService, EmployeesService>();
builder.Services.AddScoped<IGiftCardsService, GiftCardsService>();
builder.Services.AddScoped<IMenuAddonGroupService, MenuAddonGroupService>();
builder.Services.AddScoped<IMenuAddonsService, MenuAddonsService>();
builder.Services.AddScoped<IMenuService, MenuService>();
builder.Services.AddScoped<IOrdersService, OrdersService>();
builder.Services.AddScoped<IPaymentsService, PaymentsService>();
builder.Services.AddScoped<IReceiptsService, ReceiptsService>();
builder.Services.AddScoped<IServicesService, ServicesService>();
builder.Services.AddScoped<IVATService, VATService>();
builder.Services.AddSwaggerGen();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
    .AddCookie(options =>
    {
        options.Cookie.Name = "auth_cookie";
        options.Cookie.HttpOnly = true;
        options.Cookie.SameSite = SameSiteMode.Strict;
        options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    });

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseMiddleware<ExceptionHandlingMiddleware>();

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();