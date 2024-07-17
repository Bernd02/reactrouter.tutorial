import { Form, Link, NavLink, Outlet, redirect, useLoaderData, useNavigation, useSubmit } from "react-router-dom";
import { getContacts, createContact } from "../contacts"
import { useEffect } from "react";


export async function loader({ request }) {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const contacts = await getContacts(q);
    return { contacts, q };
}

export async function action() {
    const contact = await createContact();
    return redirect(`/contacts/${contact.id}/edit`);
}


export default function Root() {
    const { contacts, q } = useLoaderData();
    const navigation = useNavigation();
    const submit = useSubmit();

    useEffect(() => { document.getElementById("q").value = q }, [q]);

    const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q");

    function hasName(contact) {
        if (contact.first || contact.last)
            return true;

        return false
    }

    return (
        <>
            <div id="sidebar">
                <h1>React Router Contacts</h1>
                <div>
                    <Form id="search-form" role="search">
                        <input type="search"
                            id="q"
                            name="q"
                            defaultValue={q}
                            aria-label="Search contacts"
                            placeholder="Search"
                            className={searching ? "loading" : ""}
                            onChange={(e) => {
                                const replace = q !== null;
                                submit(e.currentTarget.form, { replace: replace });
                            }}
                        />

                        <div id="search-spinner" aria-hidden hidden={!searching}></div>
                        <div className="sr-only" aria-live="polite"></div>
                    </Form>

                    <Form method="post">
                        <button type="submit">New</button>
                    </Form>
                </div>

                <nav>
                    {contacts.length
                        ? <ul>
                            {contacts.map((contact) =>
                                <li key={contact.id}>
                                    <NavLink
                                        to={`contacts/${contact.id}`}
                                        className={({ isActive, isPending }) => {
                                            return isActive ? "active"
                                                : isPending ? "pending" : ""
                                        }}
                                    >
                                        {hasName(contact) ? `${contact.first} ${contact.last}` : <i>No Name</i>}
                                        {" "}{contact.favorite && <span>★</span>}
                                    </NavLink>
                                </li>
                            )}
                        </ul>
                        : <p>No contacts</p>
                    }
                </nav>
            </div>

            <div id="detail"
                className={navigation.state === "loading" ? "loading" : ""}>
                <Outlet />
            </div>
        </>
    );
}