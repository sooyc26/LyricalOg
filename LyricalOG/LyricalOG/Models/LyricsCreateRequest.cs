using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LyricalOG.Models
{
    public class LyricsCreateRequest
    {
        public int UserId { get; set; }
        public int BeatId { get; set; }
        public string Lyrics { get; set; }
        public int Votes { get; set; }
        public string File { get; set; }
        public string ContentType { get; set; }
        public IFormFile AudioFile { get; set; } 
    }
}