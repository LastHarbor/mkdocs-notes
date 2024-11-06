# Скрипт, для выполнения команд, через telegram бота

Появилась потребность запускать домашний комьютер/сервер удалённо.
Использование VPN накладно, и избыточно для этой задачи.
Поэтому было решено натсроить запуск скриптов командами телеграм бота.

Перечитав кучу статей по этому поводу решил сделать так

Скрипт

```mikrotik

:global botID ""        #Сюда вставить токен бота *1
:global myChatID ""     #Сюда вставить chat id *2
:global messageId 0

:while (true) do={
    :log info "Fetching updates from Telegram"
    :tool fetch url="https://api.telegram.org/bot$botID/getUpdates?offset=$messageId&timeout=60" dst-path=getUpdates.txt mode=https
    :delay 1

    :local content [/file get getUpdates.txt contents]
    :if ([:len $content] > 30) do={
        :log info "Received update: $content"
        :local startLoc ([:find $content "update_id" -1] + 11)
        :local endLoc [:find $content "," $startLoc]
        :set messageId ([:pick $content $startLoc $endLoc] + 1)

        :local startLoc ([:find $content "text" -1] + 7)
        :local endLoc [:find $content "," $startLoc]
        :local message [:pick $content ($startLoc + 1) ($endLoc - 1)]

        :local startLoc ([:find $content "chat" -1] + 12)
        :local endLoc [:find $content "," $startLoc]
        :local chatId [:pick $content $startLoc $endLoc]

        :log info "Message: $message from chat: $chatId"
        :if (($chatId = $myChatID) and ([system script find name=$message] != "")) do={
            :log info "Executing script: $message"
            :system script run $message
        } else={
            :tool fetch url="https://api.telegram.org/bot$botID/sendMessage?chat_id=$chatId&text=Unknown command: $message" mode=https keep-result=no
        }
    } else={
        :log error "No valid updates received"
    }
}

```

*1 - Токен бота достаётся из botFather при его создании

*2 - Чат ID мы можем получить перейдя по ссылке [https://api.telegram.org/bot"botToken"/getUpdates](https://api.telegram.org/bot"botToken"/getUpdates)

Следующий этап это создание задания по рассписанию (scheldue)

```mikrotik

:system script run ParseTelegramMessages

```

Данную строчку нужно добавить в новосозданное расписание.

Скрипт для WOL

```mikrotik

/tool wol mac=80:E8:2C:E5:A3:4B interface=lan-bridge

/tool fetch url="https://api.telegram.org/bot"botToken"/sendmessage?chat_id="chatID"&text=WOL PC ok" keep-result=no


```
