using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Server.Migrations
{
    /// <inheritdoc />
    public partial class ChangedSomeNamingCase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Price_wo_vat",
                table: "OrderDetails",
                newName: "PriceWtVat");

            migrationBuilder.RenameColumn(
                name: "Price_w_vat",
                table: "OrderDetails",
                newName: "PriceWoVat");

            migrationBuilder.RenameColumn(
                name: "Price_wo_vat",
                table: "OrderDetailAddOns",
                newName: "PriceWoVat");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PriceWtVat",
                table: "OrderDetails",
                newName: "Price_wo_vat");

            migrationBuilder.RenameColumn(
                name: "PriceWoVat",
                table: "OrderDetails",
                newName: "Price_w_vat");

            migrationBuilder.RenameColumn(
                name: "PriceWoVat",
                table: "OrderDetailAddOns",
                newName: "Price_wo_vat");
        }
    }
}
