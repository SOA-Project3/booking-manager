run:
	gcloud functions deploy booking --runtime nodejs18 --trigger-topic booking-backend --entry-point app --allow-unauthenticated


set: 
	export GOOGLE_APPLICATION_CREDENTIALS="/home/diani/Downloads/soa-gr6-p3-c59dcdd7fa7a.json"
	export keyfile="/home/diani/Downloads/soa-gr6-p3-c59dcdd7fa7a.json"
	gcloud config set project soa-gr6-p3