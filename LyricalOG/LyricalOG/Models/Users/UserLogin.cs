using Microsoft.AspNet.Identity.EntityFramework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LyricalOG.Models.Users
{
    public class UserLogin 
    {
        public int UserId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string SessionToken { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsVerified { get; set; }
        public UserIdentity Identity { get; set; }
        public DateTime DateCreated { get; set; }
    }

    public class UserIdentity:IdentityUser
    {
        public bool Authentication { get; set; }
        public bool IsAdmin { get; set; }
        public string SessionToken { get; set; }
    }
}