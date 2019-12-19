using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myCrudApp.Models.Users
{
    public class UserUpdateResponse
    {
        public int Id { get; set; }
        public string ImageSignedUrl { get; set; }
    }
}