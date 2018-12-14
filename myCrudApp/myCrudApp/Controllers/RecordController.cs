using myCrudApp.Models.RecordModel;
using myCrudApp.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.Web.Http.Cors;

namespace myCrudApp.Controllers
{
    [AllowAnonymous]
    [RoutePrefix("api")]
    [EnableCors(origins: "*", headers: "*", methods: "*")]
    public class RecordController:ApiController
    {
        RecordService _recordService;

        HttpRequestMessage req = new HttpRequestMessage();
        HttpConfiguration configuration = new HttpConfiguration();
        public RecordController()
        {
            _recordService = new RecordService();
            req.Properties[System.Web.Http.Hosting.HttpPropertyKeys.HttpConfigurationKey] = configuration;
        }

        [HttpPost, Route("record")]
        public HttpResponseMessage Create(RecordCreateRequest request)
        {
            if (request == null)
            {
                return this.Request.CreateResponse(HttpStatusCode.BadRequest, "please enter valid input");
            }
            var response = _recordService.Create(request);

            return req.CreateResponse(HttpStatusCode.OK, response);
        }

    }
}