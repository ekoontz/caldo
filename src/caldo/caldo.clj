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
   [clojure.repl :refer [doc]]
   [clojure.set :refer [union]]
   [clojure.string :as string]
   [clojure.tools.logging :as log]
   [compojure.core :as compojure :refer [context GET PUT POST DELETE ANY]]
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

(defmacro passthru-authorization [path request response]
  `(do (log/info (str "passthru authorized request: " ~path))
       ~response))

(defmacro authenticated-routes [auth-fn & routes]
  (let [mess-with-routes (map (fn [route]
                                (do (log/debug (str "found a route:" route))
                                    (let [[verb path request response] route
                                          wrapped-response `(~auth-fn ~path ~request ~response)]
                                      (log/debug (str " verb: " verb))
                                      (log/debug (str " path: " path))
                                      (log/debug (str " request: " request))
                                      (log/debug (str " response: " response))
                                      (log/debug (str " wrapped-response: " wrapped-response))
                                      (list verb path request wrapped-response)
                                      )))
                              routes)]
    `(compojure/routes ~@mess-with-routes)))

(def routes-fn
  (fn [auth-fn]
    (authenticated-routes
     (fn [path request response]
       (auth-fn path request response))

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
   
     (GET "/randomroot" request
          (let [wordclass (Integer. (:class (:params request)))
                word (cond
                       (= 0 wordclass)
                       ;; class 1: verbs
                       (first (shuffle italiano/infinitives))

                       (= 1 wordclass)
                       ;; class 2: subjects
                       (first (shuffle (filter (fn [k]
                                                 (< (count k) 10)) ;; filter out long (> 10 char) words
                                               (union italiano/nominative-pronouns
                                                      italiano/propernouns))))

                       ;; class 3: articles
                       (= 2 wordclass)
                       (first (shuffle italiano/articles))
                       
                       (= 3 wordclass)
                       (first (shuffle italiano/nouns)))]
            {:headers {"Content-type" "application/json;charset=utf-8"}
             :body (write-str {:root word})}))
     
     (GET "/say" request
          {:status 200
           :headers {"Content-type" "application/json;charset=utf-8"}
           :body (let [expr (:expr (:params request))
                       parsed (reduce concat (map :parses (parse expr)))
                       roots (get-roots parsed)
                     debug (log/debug (str "# parses('" expr "'): " (count parsed)))]
                   (log/info (str "roots: " (string/join ";" roots)))
                   (write-str {:roots roots}))}))))
(def app
  (handler/site 
   (friend/authenticate
    (compojure/routes
     (route/resources "/")

     ;; allow this app to work with either "/" or..
     (apply routes-fn [(fn [path request response]
                         (passthru-authorization path request response))])

     ;; .. with "/caldo"
     (context "/caldo" []
              (apply routes-fn [(fn [path request response]
                                  (passthru-authorization path request response))])))

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
                (get-in parse [:root :italiano :italiano]))
              (get-in parse [:comp :head :italiano :italiano])
              (get-in parse [:comp :comp :italiano :italiano])
              (get-in parse [:head :italiano :italiano])
              (get-in parse [:comp :italiano :italiano])])
           parses)))
