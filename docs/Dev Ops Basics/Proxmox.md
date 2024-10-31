# Proxmox tips

---

## Убить виртуальную машину

rm /var/lock/qemu-server/***-lock.conf

qm stop ***.

## WOL

1. Для включения WOL необходимо сначала настроить на материнской плате пробуждение по PCI.
2. Проверить параметр WOL в ethtool, для этого вводим  

    ```ethtool enp3s0```

3. Далее настраиваем WOL через systemd.

    3.1 Создадим юнит systemd

    ```bash
    sudo systemctl edit wol.service --full --force
    ```

    3.2 Далее вставим туда эту строку, где enp3s0 это ваше имя интерфейса

    ```bash
    [Unit]
    Description=Enable Wake-on-LAN
    After=network-online.target
    [Service]
    Type=oneshot
    ExecStart=/sbin/ethtool --change enp3s0 wol g
    [Install]
    WantedBy=network-online.target
    ```

    3.3 Включим юнит и добавим симлинк.

    ```bash
    sudo systemctl daemon-reload
    sudo systemctl enable wol.service
    sudo systemctl start wol.service
    ```

4. Готово

    [Как удаленно разбудить Linux по сети с помощью Wake On Lan? | Windows для системных администраторов](https://winitpro.ru/index.php/2024/02/06/wake-on-lan-razbudit-linux-po-seti/)
