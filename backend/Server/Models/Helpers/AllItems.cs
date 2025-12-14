    using backend.Server.Models.DatabaseObjects;

    namespace backend.Server.Models.Helpers;
    public class AllItems<Class>
    {
        public List<Class>? List { get; set; }
        public int Page { get; set; }
        public int PerPage { get; set; }
    }
