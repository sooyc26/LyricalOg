using Amazon;
using Amazon.S3;
using LyricalOG.Models;
using LyricalOG.Models.RecordModel;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;
using System.Data;
using Amazon.Runtime;
using Amazon.S3.Model;
using LyricalOG.Interfaces;

namespace LyricalOG.Services
{
    public class RecordService : IS3RecordProvider
    {
        readonly string connString = ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
        readonly string accessKey = ConfigurationManager.AppSettings["S3_AccessKeyId"];                     //get S3 Access Key Id from web.config
        readonly string secretKey = ConfigurationManager.AppSettings["S3_SecretAccessKey"];                 //get S3 secret Key from web.config

        private const string bucketName = "lyricalog";
        private static readonly RegionEndpoint bucketRegion = RegionEndpoint.USWest1;                       //s3 region N California
        private static IAmazonS3 s3Client;


        public LyricsCreateResponse Create(RecordCreateRequest request)
        {
            var response = new LyricsCreateResponse();

            var signedURL = GeneratePreSignedURL(request.File, request.ContentType);  //get signedURL to update resumeUrl in S3
                var slicedUrl = SignedUrlWithNoExpire(request.File);
            using (var conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "S3Audio_Insert";
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserId", request.UserId);
                cmd.Parameters.AddWithValue("@BeatUrl", request.BeatUrl);
                cmd.Parameters.AddWithValue("@S3SignedUrl", slicedUrl);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        response.LyricId = Convert.ToInt32(reader["AudioId"]);
                        response.SignedUrl = signedURL;
                    }
                    reader.Close();
                }
                conn.Close();
            }
            return response;
        }

        public string GeneratePreSignedURL(string fileName, string contentType)
        {
            AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
            s3Client = new AmazonS3Client(credentials, bucketRegion);

            GetPreSignedUrlRequest request = new GetPreSignedUrlRequest
            {
                BucketName = bucketName,
                Key = fileName,
                ContentType = contentType,
                Verb = HttpVerb.PUT,
                Expires = DateTime.Now.AddYears(1)

            };

            string url = s3Client.GetPreSignedURL(request);
            return url;
        }

        public string SignedUrlWithNoExpire( string fileName)
        {
            return "https://lyricalog.s3.us-west-1.amazonaws.com/" + fileName + "?AWSAccessKeyId=AKIAJBHBICKUWGGTVSZQ";
        }

        public int Delete( int id)
        {
            int retId = 0;

            using (var conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Records_Delete";
                cmd.CommandType = CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@UserId", id);
                cmd.ExecuteNonQuery();

                conn.Close();
            }
            return retId;
        }
        public int DeleteObjectNonVersionedBucketAsync(string objName)
        {
            AWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
            s3Client = new AmazonS3Client(credentials, bucketRegion);
            try
            {
                var deleteObjectRequest = new DeleteObjectRequest
                {
                    BucketName = bucketName,
                    Key = objName
                };

                Console.WriteLine("Deleting an object");
                s3Client.DeleteObjectAsync(deleteObjectRequest);
            }
            catch (AmazonS3Exception e)
            {
                Console.WriteLine("Error encountered on server. Message:'{0}' when writing an object", e.Message);
            }
            catch (Exception e)
            {
                Console.WriteLine("Unknown encountered on server. Message:'{0}' when writing an object", e.Message);
            }

            return 0;
        }
    }
}
