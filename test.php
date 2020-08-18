<?php
include(__DIR__ . '/vendor/autoload.php');

use MinecraftPinger\MinecraftPinger;
use MinecraftPinger\MinecraftPingException;

$pinger = new MinecraftPinger('mc.hypixel.net', 25565); // Port is optional
try
{
    $pingResponse = $pinger->ping();
    echo 'There are ' . $pingResponse->players->online . ' players online on Hypixel!' . "\n";
}
catch (MinecraftPingException $e)
{
    // An error has occurred
    echo $e->getMessage();
}
