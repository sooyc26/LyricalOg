using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using myCrudApp.Models;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Web;

namespace myCrudApp.Services
{
    public class LyricService
    {
        readonly string connString = ConfigurationManager.ConnectionStrings["Default"].ConnectionString;
        readonly string accessKey = ConfigurationManager.AppSettings["S3_AccessKeyId"];                     //get S3 Access Key Id from web.config
        readonly string secretKey = ConfigurationManager.AppSettings["S3_SecretAccessKey"];                 //get S3 secret Key from web.config

        private const string bucketName = "lyricalog";
        private static readonly RegionEndpoint bucketRegion = RegionEndpoint.USWest1;                       //s3 region N California
        private static IAmazonS3 s3Client;

        public LyricsCreateResponse Create(LyricsCreateRequest request)
        {
            int id = 0;

            var response = new LyricsCreateResponse();

            var signedURL = GeneratePreSignedURL(request.File, request.ContentType);  //get signedURL to update resumeUrl in S3

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Insert";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Lyrics", request.Lyrics);
                cmd.Parameters.AddWithValue("@Votes", 0);
                cmd.Parameters.AddWithValue("@FileUrl", signedURL);

                cmd.Parameters.AddWithValue("@Id", SqlDbType.Int).Direction = ParameterDirection.Output;

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        id = (int)reader["Id"];
                    }
                    reader.Close();
                }
                conn.Close();
            }
            response.UserId = id;
            response.SignedUrl = signedURL;
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
                Expires = DateTime.Now.AddDays(15)
            };

            string url = s3Client.GetPreSignedURL(request);
            return url;
        }

        public List<Lyrics> ReadAll()
        {
            var lyrics = new List<Lyrics>();

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_SelectAll";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var lyric = new Lyrics()
                        {
                            Id = (int)reader["Id"],
                            Lyric = (string)reader["Lyrics"],
                            Votes = (int)reader["Votes"]
                        };
                        lyrics.Add(lyric);
                    }
                    conn.Close();
                }
            }
            return lyrics;
        }

        public Lyrics ReadById(int id)
        {
            var lyrics = new Lyrics();

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Select_ById";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;
                cmd.Parameters.AddWithValue("@Id", id);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        var lyric = new Lyrics()
                        {
                            Id = (int)reader["Id"],
                            Lyric = (string)reader["Lyrics"],
                            Votes = (int)reader["Votes"]
                        };
                        lyrics = lyric;
                    }
                }
                conn.Close();
            }
            return lyrics;
        }

        public int UpdateLyrics(LyricsUpdateRequest request, int id)
        {
            int retId = 0;
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Update";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Id", id);
                cmd.Parameters.AddWithValue("@Lyrics", request.Lyrics);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        retId = (int)reader["Id"];
                    }
                }
                conn.Close();
            }
            return retId;
        }

        public int UpdateVotes(int id)
        {
            int retId = 0;
            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Lyrics_Update_Votes";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Id", id);

                using (SqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        retId = (int)reader["Id"];
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
                cmd.CommandText = "Lyrics_Delete";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Id", id);
                cmd.ExecuteNonQuery();

                conn.Close();
            }
            return id;
        }

    }
}