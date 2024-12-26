import psycopg2
import json
import boto3
import os

def handler(event, context):
    secret_arn = os.environ['DB_SECRET']
    region_name = "us-east-1"

    # Fetch the secret using AWS Secrets Manager
    client = boto3.client('secretsmanager', region_name=region_name)
    response = client.get_secret_value(SecretId=secret_arn)

    # Parse the secret
    secret = json.loads(response['SecretString'])
    dbname = secret['dbname']
    username = secret['username']
    password = secret['password']
    host = secret['host']
    port = secret['port']

    # Connect to the database
    conn = psycopg2.connect(
        dbname= dbname,
        user=username,
        password=password,
        host=host,
        port=port,
        sslmode='require'
    )
    
    cur = conn.cursor()
    cur.execute("CREATE USER service_user WITH LOGIN;")
    cur.execute("GRANT rds_iam TO service_user;")
    conn.commit()
    cur.close()
    conn.close()

    return {"status": "success"}
