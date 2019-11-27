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
using System.Security.Cryptography;
using System.Text;
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

        private string GetUniqueKey(int maxSize)
        {
            char[] chars = new char[62];
            chars =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890".ToCharArray();
            byte[] data = new byte[1];
            using (RNGCryptoServiceProvider crypto = new RNGCryptoServiceProvider())
            {
                crypto.GetNonZeroBytes(data);
                data = new byte[maxSize];
                crypto.GetNonZeroBytes(data);
            }
            StringBuilder result = new StringBuilder(maxSize);
            foreach (byte b in data)
            {
                result.Append(chars[b % (chars.Length)]);
            }
            return result.ToString();
        }
        public BeatCreateResponse Create(Beat request)
        {
            var id = 0;
            var response = new BeatCreateResponse();
            var beatNoExpire = request.Title + "_" + request.Producer + "_beat_" + GetUniqueKey(16);
            var imgNoExpire = request.Title + "_" + request.Producer + "_img_"  + GetUniqueKey(16);
            var slicedUrl = SignedUrlWithNoExpire(null);
            var sliceImgUrl = "";
            if(request.ImgFileType !=null) sliceImgUrl= SignedUrlWithNoExpire(null);


            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Beats_Insert";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@Producer", request.Producer);
                cmd.Parameters.AddWithValue("@Title", request.Title);
                cmd.Parameters.AddWithValue("@UploaderId", request.UploaderId);
                cmd.Parameters.AddWithValue("@Vibe", request.Vibe);
                cmd.Parameters.AddWithValue("@Description", request.Description);
                cmd.Parameters.AddWithValue("@SourceUrl", slicedUrl);
                cmd.Parameters.AddWithValue ("@ImageUrl", sliceImgUrl);

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

            response.BeatSignedUrl = GeneratePreSignedURL("B"+ id.ToString(), request.BeatFileType);  //get signedURL to update resumeUrl in S3

            if (request.ImgFileType != null)
            {
                response.ImgSignedUrl = GeneratePreSignedURL("BI" + id.ToString(), request.ImgFileType);  //get signedURL to update resumeUrl in S3
            }
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
                            UploaderId = (int)reader["UploaderId"],
                            Title = (string)reader["Title"],
                            Producer = (string)reader["Producer"],
                            BeatUrl = (string)reader["BeatUrl"],
                            Description = reader["Description"]==DBNull.Value ? "":(string)reader["Description"],
                            Vibe = (string)reader["Vibe"],
                            LyricsCount = (int)reader["LyricsCount"],
                            DateCreated = (DateTime)reader["DateCreated"],
                            Visible = (bool)reader["Visible"]
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
                            Description = reader["Description"] == DBNull.Value ? "" : (string)reader["Description"],
                            Vibe = (string)reader["Vibe"],
                            LyricsCount = (int)reader["LyricsCount"],
                            DateCreated = (DateTime)reader["DateCreated"],
                            Visible = (bool)reader["Visible"],
                            ImgUrl = reader["ImageUrl"] == DBNull.Value ? (string)"https://lyricalog.s3-us-west-1.amazonaws.com/cloudLightning.png" : (string)reader["ImageUrl"],
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
                //cmd.Parameters.AddWithValue("@BeatUrl", request.BeatUrl);
                cmd.Parameters.AddWithValue("@Description", request.Description);

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

        public int ToggleVisiblity(int id)
        {

            using (SqlConnection conn = new SqlConnection(connString))
            {
                conn.Open();

                SqlCommand cmd = conn.CreateCommand();
                cmd.CommandText = "Beats_Toggle_Visibility";
                cmd.CommandType = System.Data.CommandType.StoredProcedure;

                cmd.Parameters.AddWithValue("@BeatId", id);
                cmd.ExecuteNonQuery();

                conn.Close();
            }
            return id;
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