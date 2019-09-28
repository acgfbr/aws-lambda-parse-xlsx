# aws-lambda-parse-xlsx
Função lambda que parseia um xlsx e insere no banco.


Essa função recebe um SQS com um payload, nele contém o nome do arquivo no s3.

# A rotina é a seguinte:

> 1 - Baixa o arquivo do s3.
>  2 - Parseia o xlsx.
>  3 - Insere no banco.

##Benchmark: 122.000 registros em 30 segundos.
