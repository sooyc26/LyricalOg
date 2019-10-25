using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using LyricalOG.Interfaces;
using LyricalOG.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace LyricalOG.Services
{
    public class BeatService: IBeatProvider
    {
        readonly string connString = ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
        readonly string accessKey = ConfigurationManager.AppSettings["S3_AccessKeyId"];                     //get S3 Access Key Id from web.config
        readonly string secretKey = ConfigurationManager.AppSettings["S3_SecretAccessKey"];                 //get S3 secret Key from web.config

        private const string bucketName = "lyricalog";
        private static readonly RegionEndpoint bucketRegion = RegionEndpoint.USWest1;                       //s3 region N California
        private static IAmazonS3 s3Client;

        public BeatCreateResponse Create(Beat request)
        {
            var id = 0;
            var response = new BeatCreateResponse();
            var slicedUrl = SignedUrlWithNoExpire(request.Title+"_"+request.Producer);

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Beats_Insert";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Producer", request.Producer);
                cmd.Parameters.AddWithValue("@Title", request.Title);
                cmd.Parameters.AddWithValue("@Vibe", request.Vibe);
                cmd.Parameters.AddWithValue("@IsUpload", request.BeatUrl != ""? false:true);
                cmd.Parameters.AddWithValue("@SourceUrl", request.BeatUrl!=""? request.BeatUrl: slicedUrl);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        id = Convert.ToInt32(reader["BeatId"]);
                    }
                    reader.Close();
                }
                conn.Close();
            }
            response.BeatId = id;
            if (request.BeatUrl =="")response.SignedUrl = GeneratePreSignedURL(request.Title + "_" + request.Producer, request.ContentType);  //get signedURL to update resumeUrl in S3

            return response;
        }
        public string SignedUrlWithNoExpire(string producerName)
        {
            return "https://lyricalog.s3.us-west-1.amazonaws.com/" + producerName + "?AWSAccessKeyId=" + accessKey;
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
                Expires = DateTime.Now.AddDays(15)
            };

            string url = s3Client.GetPreSignedURL(request);
            return url;
        }
        public List<Beat> ReadAll()
        {
            var retModel = new List<Beat>();

            using(var conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd= conn.CreateCommand();
                cmd.CommandText = "Beats_Select_All";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var beat = new Beat()
                        {
                            Id = (int)reader["BeatId"],
                            Title = (string)reader["Title"],
                            Producer = (string)reader["Producer"],
                            BeatUrl = (string)reader["BeatUrl"],
                            Vibe = (string)reader["Vibe"],
                            LyricsCount = (int)reader["LyricsCount"],
                            DateCreated = (DateTime)reader["DateCreated"]
                        };
                        retModel.Add(beat);
                    }
                    conn.Close();
                }
            }
            return retModel;
        }
        public Beat ReadById(int id)
        {
            var retModel = new Beat();

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Beats_Select_ById";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@BeatId", id);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var beat = new Beat()
                        {
                            Id = (int)reader["BeatId"],
                            Title = (string)reader["Title"],
                            Producer = (string)reader["Producer"],
                            BeatUrl = (string)reader["BeatUrl"],
                            Vibe = (string)reader["Vibe"],
                            LyricsCount = (int)reader["LyricsCount"],
                            DateCreated = (DateTime)reader["DateCreated"]
                        };
                        retModel = beat;
                    }
                }
                conn.Close();
            }
            return retModel;
        }
        public int Update(Beat request)
        {
            int retId = 0;
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Beat_Update";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@BeatId", request.Id);

                cmd.Parameters.AddWithValue("@Title", request.Title);
                cmd.Parameters.AddWithValue("@Producer", request.Producer);
                cmd.Parameters.AddWithValue("@Vibe", request.Vibe);
                cmd.Parameters.AddWithValue("@BeatUrl", request.BeatUrl);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        retId = (int)reader["BeatId"];
                    }
                }
                conn.Close();
            }
            return retId;
        }

        public int Delete(int id)
        {

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Beats_Delete_ById";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@BeatId", id);
                cmd.ExecuteNonQuery();

                conn.Close();
            }
            return id;
        }
    }
}