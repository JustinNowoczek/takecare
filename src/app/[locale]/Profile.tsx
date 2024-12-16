import Image from 'next/image'
import React from 'react'

export default function Profile() {
	return (
		<div className="pb-6">
			<Image
				src="/im.png"
				className="mb-2 rounded-full"
				width={80}
				height={80}
				alt="user profile"
			/>
			<h2 className="text-lg text-tcprimary">Imię Nazwisko </h2>
			<span className="text-tctextGray">
				Operator
				<br />
				name@gmail.com
			</span>
		</div>
	)
}

