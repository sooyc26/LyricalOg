using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LyricalOG.Models.Users
{
    public class UserKeyExpireCheck
    {
        public int Id { get; set; }
        public bool ExpireBoolean { get; set; }
        public string ReturnMessage { get; set; }
    }
}