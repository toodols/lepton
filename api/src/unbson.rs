// i think this is the proper way to do it idk
#[cfg(test)]
use ::{std::str::FromStr, bson::oid::ObjectId};
use serde::Serialize;

pub struct Unbson<T: Serialize>(pub T);

// Converts all { $oid: "id" } to "id" and {"$date": {"$numberLong": "<millis>"}} to <millis>
impl<T: Serialize> Serialize for Unbson<T> {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer {
        let value = serde_json::to_value(&self.0).map_err(|_|serde::ser::Error::custom("Failed to serialize"))?;
		fn unbson(value: serde_json::Value) -> serde_json::Value {
			match value {
				serde_json::Value::Object(map) => {
					if map.len() == 1 {
						if let Some(serde_json::Value::String(id)) = map.get("$oid") {
							return serde_json::Value::String(id.clone());
						}
						if let Some(serde_json::Value::Object(map)) = map.get("$date") {
							if map.len() == 1 {
								if let Some(serde_json::Value::String(millis)) = map.get("$numberLong") {
									return serde_json::Value::Number(millis.parse().expect("Failed to parse millis"));
								}
							}
						}
					}
					serde_json::Value::Object(map.into_iter().map(|(k, v)| (k, unbson(v))).collect())
				},
				serde_json::Value::Array(array) => {
					serde_json::Value::Array(array.into_iter().map(unbson).collect())
				},
				_ => value,
			}
		}
		unbson(value).serialize(serializer)
    }
}

#[test]
fn test_serializer_works_properly(){
	#[derive(Serialize)]
	struct Doc {
		id: ObjectId,
		date: bson::DateTime,
	}
	let user = Doc {
		id: ObjectId::from_str("6344dad99cb2f5bf4df9832a").unwrap(),
		date: bson::DateTime::from_millis(123456789),
	};
	let json = serde_json::to_string(&user).unwrap();
	assert_eq!(json, r#"{"id":{"$oid":"6344dad99cb2f5bf4df9832a"},"date":{"$date":{"$numberLong":"123456789"}}}"#);
	let unbson = Unbson(user);
	let json = serde_json::to_string(&unbson).unwrap();
	assert_eq!(json, r#"{"id":"6344dad99cb2f5bf4df9832a","date":123456789}"#);
}