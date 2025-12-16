using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class RefactorOrderDetailPricing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OriginalPriceWtVat",
                table: "OrderDetails");

            migrationBuilder.RenameColumn(
                name: "PriceWtVat",
                table: "OrderDetails",
                newName: "VatRate");

            migrationBuilder.RenameColumn(
                name: "PriceWoVat",
                table: "OrderDetails",
                newName: "BasePrice");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "VatRate",
                table: "OrderDetails",
                newName: "PriceWtVat");

            migrationBuilder.RenameColumn(
                name: "BasePrice",
                table: "OrderDetails",
                newName: "PriceWoVat");

            migrationBuilder.AddColumn<decimal>(
                name: "OriginalPriceWtVat",
                table: "OrderDetails",
                type: "numeric",
                nullable: true);
        }
    }
}
