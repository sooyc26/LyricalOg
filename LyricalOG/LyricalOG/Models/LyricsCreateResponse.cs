using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LyricalOG.Models
{
    public class LyricsCreateResponse
    {
        public string SignedUrl { get; set; }
        public int LyricId { get; set; }
    }
}