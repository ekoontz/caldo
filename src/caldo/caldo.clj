(ns caldo.caldo
  (:use
   [hiccup core page]
   [ring.util.codec :as codec])
  (:require
   [caldo.auth.google :as google-auth]
   [cemerick.friend :as friend]
   [cemerick.friend [workflows :as workflows]]
   [clojure.data.json :refer [write-str]]
   [clojure.java.io :as io]
   [clojure.tools.logging :as log]
   [compojure.core :refer [context defroutes GET PUT POST DELETE ANY]]
   [compojure.route :as route]
   [compojure.handler :as handler]
   [environ.core :refer [env]]
   [friend-oauth2.workflow :as oauth2]
   [hiccup.page :as h]
   [ring.adapter.jetty :as jetty]
   [ring.middleware.session :as session]
   [ring.middleware.session.cookie :as cookie]
   [ring.middleware.stacktrace :as trace]
   [ring.util.codec :as codec]
   [ring.util.response :as resp]))

(defroutes main-routes
  (route/resources "/")

  (GET "/" request
       {:status 200
        :headers {"Content-type" "text/html;charset=utf-8"}
        :body (html [:html [:head [:title "benvenuto a caldo!"]
                            [:link {:rel "stylesheet"
                                    :type "text/css"
                                    :href "/css/caldo.css"}]
                            [:script {:type "text/javascript"
                                      :src "/js/jquery.min.js"}]
                            [:script {:type "text/javascript"
                                      :src "/js/mustache.min.js"}]
                            [:script {:type "text/javascript"
                                      :src "/js/phaser.min.js"}]
                            [:script {:type "text/javascript"
                                      :src "/js/log4.js"}]
                            [:script {:type "text/javascript"
                                      :src "/js/caldo.js"}]
                            ]
                     ;; See ../../resources/public/js/caldo.js for definition of
                     ;; the caldo() onload function: caldo().
                     ;; See ../../resources/public/mst/caldo.mst for HTML template
                     ;; used by caldo().
                     [:body {:onload "caldo();"} ]])})

  (GET "/say" request
       {:status 200
        :headers {"Content-type" "application/json;charset=utf-8"}
        :body (let [to (:to (:params request))
                    expr (:expr (:params request))
                    response (str "ciao; tu hai detto: '" expr "'")]
                (log/info (str "client is talking to: " to))
                (log/info (str " and saying: " expr))
                (log/info (str "response: " response))
                (write-str {:yousaid expr
                            :response response}))}))
(def app
  (handler/site 
   (friend/authenticate
    main-routes

    {:allow-anon? true
     :login-uri "/login"
     :default-landing-uri "/"
     :unauthorized-handler #(-> 
                             {:status 401
                              :headers {"Content-type" "text/plain;charset=utf-8"}
                              :body "Unauthorized."})

     :workflows [(workflows/interactive-form)
                 (oauth2/workflow google-auth/auth-config)]})))


