import requests, json, sys
import itertools, time
import os

urlbase = "https://api.guildwars2.com"

'''
a_ids = [
	5327, 5338, # Ash
	5312, 5278, # Blood
	5319, 5334, # Flame
	5298, 5286, # Iron
]
'''


def chunked_iterable(iterable, size):
    it = iter(iterable)
    while True:
        chunk = tuple(itertools.islice(it, size))
        if not chunk:
            break
        yield chunk

def get_achievements(uri, filename):
	data = {}

	r = requests.get(f"{urlbase}{uri}")
	all_ids = r.json()

	if os.path.exists(filename):
		with open(filename, "r") as f:
			data = json.loads(f.read())
		all_ids = set(map(str, all_ids)) - set(map(str, data.keys()))
		if not all_ids:
			print(f"No update needed to {filename}")
			return 

		all_ids = list(all_ids)
		print(f"Doing partial update for {all_ids}")
	else:
		print(f"Doing full download")

	for chunk in chunked_iterable(all_ids, 190):
		print(f"Retrieving {chunk[0]} to {chunk[-1]}")
		a_ids = ",".join(map(str, chunk))	


		r = requests.get(f"{urlbase}{uri}?ids={a_ids}")
		if not r.ok:
			print(r.status_code, r.json())
			sys.exit(1)

		if r.status_code != 200:
			print("may be missing data!")

		data.update({
			str(x["id"]): x for x in r.json()
		})

		time.sleep(1)

	with open(filename, "w") as f:
		f.write(json.dumps(data, indent=2))




get_achievements("/v2/achievements", "achievements_data.json")
get_achievements("/v2/achievements/groups", "achievement_groups.json")
get_achievements("/v2/achievements/categories", "achievement_categories.json")