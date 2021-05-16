class Storage
{
	constructor(initial)
	{
		this.reducers = initial.reducers;
		this.listeners = initial.listeners;
		this.state = initial.state;
	}

	process (event)
	{
		const reducer = this.reducers[event.type];

		if(reducer == undefined)
		{
			return;
		}

		const new_state = {... this.state};

		reducer(new_state, event.data);

		const changed_keys = [];

		for (const key of Object.keys(new_state))
		{
			if (new_state.hasOwnProperty(key))
			{
				if(this.state[key] != new_state[key])
				{
					changed_keys.push(key);
				}
			}
		}

		for(const entry of this.listeners)
		{
			const intersection =
				entry.sensitiv_for.filter(value=>changed_keys.includes(value));

			if(intersection.length != 0)
			{
				entry.action(this.state, new_state);
			}
		}

		this.state = new_state;
	}
}


function init_graph ()
{
	const s = new Storage({
		state: { prop_a: 1, prop_b: "Hallo Welt!" },
		reducers: {
			DataPoint:
				function(state, data)
				{
					console.log("process DataPoint: ", data);
					state.prop_a = 2;
					state.prop_b = "Hallo du!";
				}
		},
		listeners: [
			{ sensitiv_for: ["prop_a"],
			  action:
			 	function(prev_state, curr_state)
				{
					console.log("handler 1 called");
				}
			},
			{ sensitiv_for: ["prop_b"],
			  action:
			 	function(prev_state, curr_state)
				{
					console.log("handler 2 called");
				}
			}
		]
	});

	s.process({type:"DataPoint", data:["foo", true, 1.3]});
	s.process({type:"BogusFoo", data:["foo", true, 1.3]});
}
