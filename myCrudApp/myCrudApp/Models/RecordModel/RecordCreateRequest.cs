using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myCrudApp.Models.RecordModel
{
    public class RecordCreateRequest
    {
        public int UserId { get; set; }
        public  string BeatUrl { get; set; }
        public string File { get; set; }
        public string ContentType { get; set; }
    }
}