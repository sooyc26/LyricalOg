using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myCrudApp.Models.Users
{
    public class UserProfileDB : UserProfile
    {
        //userInfo
        //public int Id { get; set; }
        //public string Password { get; set; }
        //public string Email { get; set; }
        //public string Name { get; set; }
        //public DateTime DateCreated { get; set; }
        //public DateTime DateModified { get; set; }
        //public bool EmailVerified { get; set; }
        //public bool IsAdmin { get; set; }

        public int LyricsId { get; set; }
        public int LyricsBeatId { get; set; }
        public string LyricsTitle { get; set; }
        public string LyricsProducer { get; set; }
        public DateTime LyricsDateCreated { get; set; }

        public int BeatId { get; set; }
        public string BeatTitle { get; set; }
        public string BeatProducer { get; set; }
        public DateTime BeatUploadDate { get; set; }


    }


}