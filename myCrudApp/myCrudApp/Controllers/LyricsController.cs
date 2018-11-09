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

        public LyricsController(LyricService lyricService)
        {
            _lyricService = lyricService;
        }

        [HttpPost,Route("lyrics")]
        public HttpResponseMessage Create(LyricsCreateRequest request)
        {
            int id = _lyricService.Create(request);

            return Request.CreateResponse(HttpStatusCode.OK, new SuccessResponse());
  

        }
    }
}