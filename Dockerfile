FROM  httpd:2.4.65

COPY ./public-html/ /usr/local/apache2/htdocs/
