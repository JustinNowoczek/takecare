import React from 'react'

export default function Profile() {
	return (
		<div className="pb-6">
			<img src="/im.png" className="rounded-full mb-2" width={80} alt="user profile" />
			<h2 className="text-lg text-tcprimary">Imię Nazwisko </h2>
			<span className="text-tctextGray">
				Operator
				<br />
				name@gmail.com
			</span>
		</div>
	)
}

