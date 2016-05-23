(ns caldo.caldo
  (:refer-clojure :exclude [get-in])
  (:require
   [dag_unify.core :refer [get-in unify]]
   [babel.italiano :as italiano :refer [generate lexicon parse]]
   [caldo.auth.google :as google-auth]
   [cemerick.friend :as friend]
   [cemerick.friend [workflows :as workflows]]
   [clojure.data.json :refer [write-str]]
   [clojure.java.io :as io]
   [clojure.set :refer [union]]
   [clojure.string :as string]
   [clojure.tools.logging :as log]
   [compojure.core :refer [context defroutes GET PUT POST DELETE ANY]]
   [compojure.route :as route]
   [compojure.handler :as handler]
   [environ.core :refer [env]]
   [friend-oauth2.workflow :as oauth2]
   [hiccup.core :as h :refer [html]]
   [ring.adapter.jetty :as jetty]
   [ring.middleware.session :as session]
   [ring.middleware.session.cookie :as cookie]
   [ring.middleware.stacktrace :as trace]
   [ring.util.codec :as codec]
   [ring.util.response :as resp]))

(declare get-roots)

(defroutes main-routes
  (route/resources "/")

  (GET "/" request
       {:status 200
        :headers {"Content-type" "text/html;charset=utf-8"}
        :body (html [:html [:head [:title "benvenuto a caldo!"]
                            [:link {:rel "stylesheet"
                                    :type "text/css"
                                    :href "/css/animate.min.css"}]
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
        :body (let [expr (:expr (:params request))
                    parsed (reduce concat (map :parses (parse expr)))
                    roots (get-roots parsed)
                    debug (log/debug (str "# parses('" expr "'): " (count parsed)))]
                (log/info (str "roots: " (string/join ";" roots)))
                (write-str {:roots roots}))})


  (GET "/randomroot" request
       (let [wordclass (:class (:params request))
             word (if (= 0 (Integer. wordclass))
                    (first (shuffle italiano/infinitives))
                    (first (shuffle (union italiano/nominative-pronouns
                                           italiano/propernouns))))]
         (log/debug (str "GET /randomroot: class=" wordclass))
         {:status 200
          :headers {"Content-type" "application/json;charset=utf-8"}
          :body (write-str {:root word})})))
        

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

(defn get-roots [parses]
  (set
   (mapcat (fn [parse]
             [(get-in parse [:comp :italiano :italiano])
              (if (get-in parse [:root :italiano :infinitive])
                (get-in parse [:root :italiano :infinitive])
                (get-in parse [:root :italiano :italiano]))])
           parses)))
