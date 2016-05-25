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

(defmacro if-authorized [request response]
  `(do (log/info (str "authorizing: " (:path-info ~request)))
       ~response))

(defmacro authenticated-routes [auth-fn & routes]
  (let [auth-fn (if auth-fn auth-fn
                    (fn [request response] ;; default
                      (if-authorized request response)))
        mess-with-routes (map (fn [route]
                                (do (log/info (str "found a route:" route))
                                    (let [[verb path request response] route
                                          wrapped-response `(~auth-fn ~request ~response)]
                                      (log/info (str " verb: " verb))
                                      (log/info (str " path: " path))
                                      (log/info (str " request: " request))
                                      (log/info (str " response: " response))
                                      (log/info (str " wrapped-response: " wrapped-response))
                                      (list verb path request wrapped-response)
                                      )))
                              routes)]
    `(compojure/routes ~@mess-with-routes)))

(def routes
  (authenticated-routes
   (fn [request response]
     (if-authorized request response))
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
        (let [wordclass (:class (:params request))
              word (if (= 0 (Integer. wordclass))
                     
                     ;; class 1: verbs
                     (first (shuffle italiano/infinitives))
                     
                     ;; class 2: subjects
                     (first (shuffle (filter (fn [k]
                                               (< (count k) 10))
                                             (union italiano/nominative-pronouns
                                                    italiano/propernouns)))))]
          
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
                 (write-str {:roots roots}))})))

(compojure/defroutes main-routes
  (route/resources "/")

  (context "/caldo" []
           routes))

(def app
  (handler/site 
   (friend/authenticate
    main-routes

    {:allow-anon? true
     :login-uri "/login"
     :default-landing-uri "/caldo"
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
