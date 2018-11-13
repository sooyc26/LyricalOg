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
    [AllowAnonymous]
    [RoutePrefix("api")]
    public class LyricsController : ApiController
    {
        LyricService _lyricService;

        HttpRequestMessage req = new HttpRequestMessage();
        HttpConfiguration configuration = new HttpConfiguration();
        public LyricsController()
        {
            _lyricService = new LyricService();
        req.Properties[System.Web.Http.Hosting.HttpPropertyKeys.HttpConfigurationKey] = configuration;
        }

        [HttpPost, Route("lyrics")]
        public HttpResponseMessage Create(LyricsCreateRequest request)
        {
            if (request == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            int id = _lyricService.Create(request);

            return req.CreateResponse(HttpStatusCode.OK, id);
        }

        [HttpGet, Route("lyrics")]
        public HttpResponseMessage ReadAll()
        {
            var lyrics = _lyricService.ReadAll();
            return req.CreateResponse(HttpStatusCode.OK, lyrics);
        }

        [HttpGet, Route("lyrics/{id:int}")]
        public HttpResponseMessage ReadById(int id)
        {
            var lyric = _lyricService.ReadById(id);
            return req.CreateResponse(HttpStatusCode.OK, lyric);
        }

        [HttpPut, Route("lyrics/{id:int}")]
        public HttpResponseMessage UpdateById(LyricsUpdateRequest request, int id)
        {
            var retId = _lyricService.Update(request, id);
            return Request.CreateResponse(HttpStatusCode.OK, retId);
        }

        [HttpDelete, Route("lyrics/{id:int}")]
        public HttpResponseMessage Delete(int id)
        {
            var retId=_lyricService.Delete(id);
            var message = "deleted Id: " + retId;
            return Request.CreateResponse(HttpStatusCode.OK, message);
        }
    }
}