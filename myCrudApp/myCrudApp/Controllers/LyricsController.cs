using myCrudApp.Models;
using myCrudApp.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;

namespace myCrudApp.Controllers
{
    public class LyricsController: ApiController
    {
        LyricService _lyricService;

        public LyricsController()
        {
            _lyricService = new LyricService();
        }

        [HttpPost,Route("lyrics")]
        public int Create(LyricsCreateRequest request)
        {
             var id = _lyricService.Create(request);
            return id;
            //return Request.CreateResponse(HttpStatusCode.OK, id);
  

        }
    }
}