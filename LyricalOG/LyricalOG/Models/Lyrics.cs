using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace LyricalOG.Models
{
    public class Lyrics
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int BeatId { get; set; }
        public User User { get; set; }
        public string Lyric { get; set; }
        public int Votes { get; set; }
        public string BeatUrl { get; set; }
        public string S3SignedUrl { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }

    }
}