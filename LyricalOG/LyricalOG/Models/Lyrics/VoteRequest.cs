using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myCrudApp.Models
{
    public class VoteRequest
    {
        public int LyricsId { get; set; }
        public int VoterId { get; set; }
    }
}