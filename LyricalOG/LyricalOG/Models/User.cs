using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LyricalOG.Models
{
    public class User
    {
        public int Id { get; set; }
        public int TypeId { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Lyrics { get; set; }
        public int Votes { get; set; }
        public string BeatUrl { get; set; }
        public string S3SignedUrl { get; set; }

        public DateTime DateCreated {get;set;}
        public DateTime DateModified { get; set; }

    }
}