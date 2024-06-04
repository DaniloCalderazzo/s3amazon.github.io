document.getElementById('loadBucketsButton').addEventListener('click', function() {
    const accessKeyId = document.getElementById('accessKeyId').value;
    const secretAccessKey = document.getElementById('secretAccessKey').value;

    AWS.config.update({
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        region: 'us-east-1' // Cambiar según tu región
    });

    const s3 = new AWS.S3();

    s3.listBuckets(function(err, data) {
        if (err) {
            console.log('Error', err);
        } else {
            const bucketSelect = document.getElementById('bucketName');
            bucketSelect.innerHTML = ''; // Limpiar las opciones

            data.Buckets.forEach(function(bucket) {
                const option = document.createElement('option');
                option.value = bucket.Name;
                option.text = bucket.Name;
                bucketSelect.appendChild(option);
            });

            // Cargar directorios del primer bucket por defecto
            if (data.Buckets.length > 0) {
                loadDirectories(data.Buckets[0].Name);
            }
        }
    });
});

document.getElementById('bucketName').addEventListener('change', function() {
    const bucketName = this.value;
    loadDirectories(bucketName);
});

document.getElementById('uploadForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const bucketName = document.getElementById('bucketName').value;
    const directoryPath = document.getElementById('directoryPath').value;
    const file = document.getElementById('fileUpload').files[0];

    const s3 = new AWS.S3();

    const params = {
        Bucket: bucketName,
        Key: directoryPath + '/' + file.name,
        Body: file,
        ACL: 'public-read'
    };

    s3.upload(params, function(err, data) {
        const resultMessage = document.getElementById('resultMessage');
        if (err) {
            resultMessage.innerHTML = `<span style="color: red;">Error: ${err.message}</span>`;
        } else {
            resultMessage.innerHTML = `<span style="color: green;">Archivo subido: <a href="${data.Location}" target="_blank">Ver archivo</a></span>`;
        }
    });
});

function loadDirectories(bucketName) {
    const s3 = new AWS.S3();
    const params = {
        Bucket: bucketName,
        Delimiter: '/'
    };

    s3.listObjectsV2(params, function(err, data) {
        if (err) {
            console.log('Error', err);
        } else {
            const directorySelect = document.getElementById('directoryPath');
            directorySelect.innerHTML = ''; // Limpiar las opciones

            data.CommonPrefixes.forEach(function(prefix) {
                const option = document.createElement('option');
                option.value = prefix.Prefix;
                option.text = prefix.Prefix;
                directorySelect.appendChild(option);
            });
        }
    });
}
