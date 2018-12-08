using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myCrudApp.Models
{
    public class LyricsCreateRequest
    {
        public string Lyrics { get; set; }
        public string File { get; set; }
        public string ContentType { get; set; } 
        public int Votes { get; set; }

    }
}