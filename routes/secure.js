
var express = require('express');
var fs = require("fs");
var multer = require('multer');
var mime = require('mime');
var execFile = require("child_process").execFile;
var exec = require("child_process").exec;

module.exports = function(sapp, io, limiter, db) {

    /* GET home page. */
    sapp.get('/', function(req, res, next) {
        //console.log("got session ID ", req.sessionID);
        res.render('sindex', { title: 'No functionality found!'});
    });

    //sapp.get('/upload', function(req, res) {
    //    res.redirect("/");
    //});

    io.on('connection', function(socket) {
        console.log("a user connected to io with sid ", socket.id);

        socket.on('client arrived', function (info) {
            console.log("i think sid=",socket.id,"client says",info);
            socket.emit("server acknowledge"); // emit to only this client
            //io.emit("new user connected"); // emit to everyone
        });
    });
};
