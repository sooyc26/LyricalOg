using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LyricalOG.Models
{
    public class Beat
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Producer { get; set; }
        public string BeatUrl { get; set; }
        public string Vibe { get; set; }
        public int LyricsCount { get; set; }
        public string ContentType { get; set; }
        public DateTime DateCreated { get; set; }
    }
}