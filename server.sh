#!/bin/bash
while true
do
    # 8080番ポートのWEBサーバーを公開します。
    # yourkey、yourdomain、yournameは、それぞれ秘密鍵のパス、サブドメイン、ユーザ名です。
    #ssh -i yourkey -R yourdomain:80:localhost:8080 yourname@tcpexposer.com
    sh server1 & sh server2 & sh server3

    # TCP Exposerの負荷低減と平滑化のため、ランダムで数十秒ほど待機させてください。
    # RANDOMはbashもしくはzshでしか使えません。
    wait_time=10  # 例 wait_time=20s
    echo "sleep ${wait_time}"
    sleep ${wait_time}
done