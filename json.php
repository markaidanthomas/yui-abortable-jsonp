<?php
header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/json');

//time_nanosleep(0, 50000000000000);
sleep($_GET['sleep']);

$a = array(
    'loadData({"title" : "Lorem ipsum dolor 1"})',
    'loadData({"title" : "Lorem ipsum dolor 2"})',
    'loadData({"title" : "Lorem ipsum dolor 3"})',
    'loadData({"title" : "Lorem ipsum dolor 4"})',
    'loadData({"title" : "Lorem ipsum dolor 5"})',
);

echo $a[rand(0, count($a)-1)];