using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace myCrudApp.Models.Users
{
    public class UserProfile
    {
        //userInfo
        public int Id { get; set; }
        public string Password { get; set; }
        public string Email { get; set; }
        public string Name { get; set; }
        public DateTime DateCreated { get; set; }
        public DateTime DateModified { get; set; }
        public bool EmailVerified { get; set; }
        public string ImageUrl { get; set; }
        public bool IsAdmin { get; set; }
        //user's lyrics list
        public List<UserLyrics> UserLyricsList { get; set; }
        //users beat list
        public List<UserBeats> UserBeatsList { get; set; }

        public UserProfile()
        {
            UserLyricsList = new List<UserLyrics>();
            UserBeatsList = new List<UserBeats>();
        }
    }
    public class UserLyrics
    {
        public int Id { get; set; }
        public int BeatId { get; set; }
        public string Title { get; set; }
        public string Producer { get; set; }
        public DateTime UploadDate { get; set; }

    }

    public class UserBeats
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Producer { get; set; }
        public DateTime UploadDate { get; set; }
    }
}