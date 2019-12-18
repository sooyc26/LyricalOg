using LyricalOG.Interfaces;
using LyricalOG.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace LyricalOG.Controllers
{
    [AllowAnonymous]
    [RoutePrefix("api")]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class RecordController:ApiController
    {
        IS3RecordProvider _recordProvider;

        HttpRequestMessage req = new HttpRequestMessage();
        HttpConfiguration configuration = new HttpConfiguration();
        public RecordController(IS3RecordProvider r)
        {
            _recordProvider = r;
            req.Properties[System.Web.Http.Hosting.HttpPropertyKeys.HttpConfigurationKey] = configuration;
        }

        //[HttpPost, Route("record")]
        //public HttpResponseMessage Create(RecordCreateRequest request)
        //{
        //    if (request == null)
        //    {
        //        return this.Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
        //    }
        //    var response = _recordProvider.Create(request);

        //    return req.CreateResponse(HttpStatusCode.OK, response);
        //}

    }
}