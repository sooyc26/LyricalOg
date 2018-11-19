using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myCrudApp.Models
{
    public class UsersCreateRequest
    {
        public int Id { get; set; }
        public int TypeId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Paswword { get; set; }
        public Boolean Confirmed { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
    }
}